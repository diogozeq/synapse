#!/usr/bin/env python3
"""
Export project archive tree with file contents to `archive_tree.json`.

Usage:
  python export_archive_tree.py            # writes ./archive_tree.json
  python export_archive_tree.py -r src -o /tmp/tree.json

Skips common large folders like .git and node_modules. Binary files are base64-encoded.
"""
import os
import sys
import json
import base64
import argparse


SKIP_DIRS = {'.git', 'node_modules', '__pycache__', 'venv', '.venv', 'dist', 'build', '.pytest_cache'}


def is_binary_bytes(b: bytes) -> bool:
    # Heuristic: NUL byte or malformed utf-8
    if b"\x00" in b:
        return True
    try:
        b.decode('utf-8')
        return False
    except Exception:
        return True


def read_file_content(path: str):
    with open(path, 'rb') as f:
        raw = f.read()
    if is_binary_bytes(raw):
        return {
            'encoding': 'base64',
            'content': base64.b64encode(raw).decode('ascii')
        }
    else:
        text = raw.decode('utf-8')
        return {
            'encoding': 'utf-8',
            'content': text
        }


def build_tree(root: str):
    root = os.path.abspath(root)

    def _build(dir_path: str):
        node = {
            'type': 'directory',
            'name': os.path.basename(dir_path) if os.path.basename(dir_path) else dir_path,
            'path': os.path.relpath(dir_path, root),
            'children': []
        }

        try:
            entries = sorted(os.listdir(dir_path), key=lambda s: s.lower())
        except PermissionError:
            return node

        for name in entries:
            full = os.path.join(dir_path, name)
            rel = os.path.relpath(full, root)
            if os.path.isdir(full):
                if name in SKIP_DIRS:
                    continue
                node['children'].append(_build(full))
            else:
                try:
                    file_obj = {
                        'type': 'file',
                        'name': name,
                        'path': rel.replace('\\', '/'),
                    }
                    content_obj = read_file_content(full)
                    file_obj.update(content_obj)
                    node['children'].append(file_obj)
                except Exception as e:
                    node['children'].append({
                        'type': 'file',
                        'name': name,
                        'path': rel.replace('\\', '/'),
                        'error': str(e)
                    })

        return node

    return _build(root)


def main():
    parser = argparse.ArgumentParser(description='Export archive tree with file contents.')
    parser.add_argument('-r', '--root', default='.', help='Project root to walk (default: current dir)')
    parser.add_argument('-o', '--output', default='archive_tree.json', help='Output JSON file path')
    args = parser.parse_args()

    tree = build_tree(args.root)

    with open(args.output, 'w', encoding='utf-8') as out:
        json.dump(tree, out, ensure_ascii=False, indent=2)

    print(f'Wrote archive tree to: {os.path.abspath(args.output)}')


if __name__ == '__main__':
    main()
