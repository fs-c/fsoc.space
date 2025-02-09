---
title: "Overthinking Tarkov Cultist Circle Inputs"
date: 2025-02-07
description: Using complex technology to solve simple problems
tags: []
---

**TL;DR**: I used a LP solver to find the optimal inputs for the Tarkov cultist circle, using current flea market prices obtained through [tarkov.dev](https://tarkov.dev/). [Here's the website](https://tarkov-cco.pages.dev/), the code is on [GitHub](https://github.com/fs-c/tarkov-cco).

![Screenshot of the website, on the left are the optimal solutions, best is top left. On the right is a searchable list of all items that were considered, with base and flea market price.](/assets/posts/tarkov-cco-landing-1.png)

[Tarkov](https://www.escapefromtarkov.com) (a game) has this mechanic where you can input some items into a "cultist circle", wait for a while, and then receive some items in return. What items you get out depends on the value of the items you put in.

There [are some patterns to this](https://escapefromtarkov.fandom.com/wiki/Hideout#Cultist_Circle), the one that is important here is the following: If the items put in exceed a total base value of 400k, there is a chance that the resulting items are ones that are needed for a current quest. But the base value of an item may be quite different from its flea market (player to player market) value, so I wanted to optimize for that difference.

### Getting the Data

This is trivial if you know where to look, since the [tarkov.dev API](https://tarkov.dev/api/) provides all data that is needed in a nice, free GraphQL API. The query would look something like this:

```typescript
await fetch("https://api.tarkov.dev/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `{
        items {
            id
            name
            basePrice
            lastLowPrice
        }
    }`,
  }),
});
```

This will give you a list of all items in the game, with their base price and last low price (they also offer some other fields for market price, you may want to experiment some more).

At this point we can already filter the list to narrow the problem space and make it easier for our solver later. In particular, exclude items

- above/below a certain base value (in principle this means we lose optimality, but e.g. setting a min base price of 30k can exclude a significant number of items, and they would be unlikely to be part of an optimal solution)
- that can't be used as inputs (e.g. posters)
- that have weird compound base values (armors with plates, weapon presets)
- whose value depends on durability, since we don't have that data for our flea market prices (e.g. keys/keycards)

Using filters along those lines I could reduce the list to <500 items, which made the problem solvable in milliseconds.

### Solving the Problem

This was a bit of a journey. I started out with a simple greedy algorithm (which an AI suggested to me), but it was much too slow. So I looked around for optimization problem solvers, and found a couple that were promising. For using these, it was useful to define the problem a little more formally:

1. **Goal**: Minimize the sum of the actual market prices of the items that we choose. (To put into the circle.)
2. **Constraint**: The sum of the base values of the items that we choose must exceed 400k.
3. **Constraint**: No more than 5 items may be chosen.
4. **Bounds**: The number of each item must be positive (and may not exceed 5 of course, but that's already covered by the constraint).

Initially I was going to use [highs.js](https://github.com/lovasoa/highs-js), a JS wrapper for the [HiGHS](https://github.com/ERGO-Code/HiGHS) linear programming solver. But it turns out that the API is not very nice (required me to generate the problem as a string in CPLEX LP format, which is awkward to work with), and sometimes the results were just wrong: I kept getting a negative number of some items in the "optimal" solution, which violated the bounds. When I compiled the most recent version of HiGHS, it was working as expected, but I didn't get anywhere when I tried to make highs.js use that.

So I switched to [glpk.js](https://github.com/jvail/glpk.js/), which is a JS wrapper for the [GLPK](https://www.gnu.org/software/glpk/) linear programming solver. This one had a nicer API (even though the documentation is not great), and it finally worked as expected. In the end I got the relevant code down to a few dozen lines.

```typescript
let glpk: ReturnType<typeof GLPK> | undefined;

async function getSolution(
  items: ItemMetadata[],
  minimumBasePriceSum: number,
  maximumNumberOfItems: number
): Promise<{ item: ItemMetadata; count: number }[]> {
  if (!glpk) {
    glpk = await GLPK();
  }

  const glpkResult = await glpk.solve({
    name: "LP",
    objective: {
      direction: glpk.GLP_MIN,
      name: "objective",
      vars: items.map((item) => ({
        name: item.id,
        coef: item.lastLowPrice,
      })),
    },
    subjectTo: [
      {
        name: "minimumBasePriceConstraint",
        vars: items.map((item) => ({
          name: item.id,
          coef: item.basePrice,
        })),
        bnds: {
          type: glpk.GLP_LO,
          lb: minimumBasePriceSum,
          ub: Infinity,
        },
      },
      {
        name: "numberOfItemsConstraint",
        vars: items.map((item) => ({ name: item.id, coef: 1 })),
        bnds: {
          type: glpk.GLP_UP,
          lb: 0,
          ub: maximumNumberOfItems,
        },
      },
    ],
    generals: items.map((item) => item.id),
  });

  const solution: { item: ItemMetadata; count: number }[] = [];

  for (const key in glpkResult.result.vars) {
    const value = glpkResult.result.vars[key];
    if (value > 0) {
      const item = items.find((item) => item.id === key);
      if (!item) {
        console.warn("item not found", key);
        continue;
      }

      solution.push({
        item,
        count: value,
      });
    }
  }

  return solution;
}
```

But of course market prices can change quite rapidly. I was playing around with iterating back in time and calculating the optimal inputs for the past 12 hours or something, but that didn't work out well. In the end I just went with getting the "top X" solutions, by successively excluding items from the solution which appeared in previous solutions.

```typescript
export async function getBestSolutions(
  items: ItemMetadata[],
  minimumBasePriceSum: number,
  maximumNumberOfItems: number,
  numberOfSolutions: number
): Promise<Solution[]> {
  const solutions: { item: ItemMetadata; count: number }[][] = [];
  const excludedItemIds: string[] = [];
  for (let i = 0; i < numberOfSolutions; i++) {
    const filteredItems = items.filter(
      (item) => !excludedItemIds.includes(item.id)
    );

    try {
      const solution = await getSolution(
        filteredItems,
        minimumBasePriceSum,
        maximumNumberOfItems
      );

      solutions.push(solution);
      excludedItemIds.push(...solution.map(({ item }) => item.id));
    } catch (e) {
      console.warn("got an error while running solver", e);
    }
  }
  return solutions;
}
```

This can pretty quickly lead to some very bad solutions, so it's important to also display the total market price of the solution when displaying the results.

### Appendix

As mentioned above, the full code for the site is on [GitHub](https://github.com/fs-c/tarkov-cco) and you can find the code for the solver in the `src/solver.ts` file. It's [hosted here](https://tarkov-cco.pages.dev/).
