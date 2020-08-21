public class InOutTests {

  public static void main(String[] args) {

    // Einlesen ganzer Zahlen
    Out.print("Bitte zwei ganze Zahlen eingeben: ");
    int i1 = In.readInt();
    int i2 = In.readInt();
    Out.println();

    // 1. Ausgeben mit MEHREREN print-Aufrufen
    Out.print("i1 = ");
    Out.println(i1);

    Out.print("i2 = ");
    Out.println(i2);
    Out.println();

    // 2. Ausgeben mit EINEM print-Aufruf durch Verketten von Strings
    Out.println("i1 = " + i1);
    Out.println("i2 = " + i2);
    Out.println();

    // 3. Ausrichten mit String.format, 3-stellig rechtsbündig
    Out.format("i1 = %3d%n", i1);
    Out.format("i2 = %3d%n", i2);
    Out.println();

    // 4. Ausrichten mit String.format, führende Nullen
    Out.format("i1 = %03d%n", i1);
    Out.format("i2 = %03d%n", i2);
    Out.println();

    // 5. Mehrere Werte in einer Zeile ausgeben
    Out.format("i1 = %d, i2 = %d%n", i1, i2);
    Out.println();

    // 6. Eine ganze Zahl (Cent) in Euro und Cent ausgeben
    Out.format("i1 = %5d,%02d Euro%n", i1 / 100, i1 % 100);
    Out.println();

    // 7. Zeichenketten/Wörter einlesen
    Out.println("Bitte Vorname und Nachname eingeben!");
    Out.print("Vorname: ");
    String firstName = In.readWord();
    Out.print("Nachname: ");
    String lastName = In.readWord();
    Out.println();

    // 8. Zeichenketten verketten
    Out.println("Name: " + firstName + " " + lastName);
    Out.println();

    // 9. Zeichenketten mit String.format ausgeben
    Out.format("Name: %s %s%n", firstName, lastName);
    Out.println();

    // 10. Ganze Zeile einlesen
    Out.println("Bitte E-Mail eingeben!");
    In.readLine(); // notwendig, weil im Eingabepuffer noch ein NewLine ist (vom letzten readWord)
    String email = In.readLine(); // Eingabe: max.mustermann@jku.at

    Out.format("E-Mail: %s%n", email);
    Out.println();

    // 11. Zeichenkette einlesen
    Out.println("Bitte Telefonnummer unter Hochkomma eingeben!");
    String phone = In.readString(); // Eingabe: "+43(0)732 2468 7132"

    Out.format("Telefon: %s%n", phone);
    Out.println();
  }

}

