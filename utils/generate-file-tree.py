import os
from graphviz import Digraph

def has_tex_files(directory):
    for item in os.listdir(directory):
        full_path = os.path.join(directory, item)
        if os.path.isdir(full_path):
            if has_tex_files(full_path):
                return True
        elif os.path.isfile(full_path) and full_path.endswith('.tex'):
            return True
    return False

def generate_file_tree(root_dir):
    tree = Digraph()
    tree.attr('node', shape='box')
    # tree.attr('graph', sep='0.5', esep='0.4')

    def traverse(current_dir, parent=None):
        if has_tex_files(current_dir):
            node_name = os.path.basename(current_dir)
            tree.node(current_dir, label=node_name)
            if parent:
                tree.edge(parent, current_dir)
            for item in os.listdir(current_dir):
                full_path = os.path.join(current_dir, item)
                if os.path.isdir(full_path):
                    traverse(full_path, current_dir)
                elif os.path.isfile(full_path) and full_path.endswith('.tex'):
                    tree.node(full_path, label=item, shape='ellipse')
                    tree.edge(current_dir, full_path)

    traverse(root_dir)
    return tree

if __name__ == "__main__":
    file_tree = generate_file_tree('../jku/2022w/')
    file_tree.render('file_system_structure', format='png', cleanup=True, engine='fdp')
    print("File system structure visualization saved as file_system_structure.png")