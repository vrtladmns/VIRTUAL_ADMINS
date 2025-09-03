#!/usr/bin/env python3
"""
Script to clean null bytes from Python files and remove __pycache__ folders.
This resolves the "SyntaxError: source code string cannot contain null bytes" issue.
"""

import os
import shutil
from pathlib import Path

def scan_and_clean_files(directory="."):
    """Scan for Python files with null bytes and clean them"""
    cleaned_files = []
    total_files = 0
    
    print("🔍 Scanning for Python files with null bytes...")
    print("=" * 60)
    
    # Walk through all directories
    for root, dirs, files in os.walk(directory):
        # Skip __pycache__ directories for now
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                total_files += 1
                
                try:
                    # Read file content
                    with open(file_path, 'rb') as f:
                        content = f.read()
                    
                    # Check for null bytes
                    if b'\x00' in content:
                        print(f"❌ Found null bytes in: {file_path}")
                        
                        # Remove null bytes
                        cleaned_content = content.replace(b'\x00', b'')
                        
                        # Write back as UTF-8
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(cleaned_content.decode('utf-8', errors='ignore'))
                        
                        cleaned_files.append(file_path)
                        print(f"✅ Cleaned: {file_path}")
                    else:
                        print(f"✅ Clean: {file_path}")
                        
                except Exception as e:
                    print(f"⚠️  Error processing {file_path}: {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 Scan Results:")
    print(f"   Total Python files: {total_files}")
    print(f"   Files cleaned: {len(cleaned_files)}")
    
    if cleaned_files:
        print(f"\n🧹 Cleaned files:")
        for file in cleaned_files:
            print(f"   - {file}")
    else:
        print("✅ No null bytes found in any Python files!")
    
    return cleaned_files

def remove_pycache_folders(directory="."):
    """Remove all __pycache__ folders"""
    pycache_folders = []
    
    print("\n🗑️  Removing __pycache__ folders...")
    print("=" * 60)
    
    for root, dirs, files in os.walk(directory):
        # Find __pycache__ directories
        for dir_name in dirs[:]:  # Copy the list to avoid modification during iteration
            if dir_name == "__pycache__":
                pycache_path = os.path.join(root, dir_name)
                try:
                    shutil.rmtree(pycache_path)
                    pycache_folders.append(pycache_path)
                    print(f"✅ Removed: {pycache_path}")
                except Exception as e:
                    print(f"⚠️  Error removing {pycache_path}: {e}")
    
    print(f"\n🗑️  Removed {len(pycache_folders)} __pycache__ folders")
    
    if pycache_folders:
        print("Removed folders:")
        for folder in pycache_folders:
            print(f"   - {folder}")
    
    return pycache_folders

def main():
    """Main function"""
    print("🚀 Python File Cleaner - Null Byte Remover")
    print("=" * 60)
    
    # Get current directory
    current_dir = os.getcwd()
    print(f"📁 Working directory: {current_dir}")
    print()
    
    # Scan and clean files
    cleaned_files = scan_and_clean_files(current_dir)
    
    # Remove __pycache__ folders
    removed_folders = remove_pycache_folders(current_dir)
    
    print("\n" + "=" * 60)
    print("🎉 Cleanup completed!")
    
    if cleaned_files:
        print(f"✅ {len(cleaned_files)} Python files were cleaned of null bytes")
    else:
        print("✅ No null bytes were found - all files were already clean")
    
    print(f"🗑️  {len(removed_folders)} __pycache__ folders were removed")
    
    print("\n🚀 You can now try running uvicorn again:")
    print("   uvicorn app.main:app --reload --port 8000")

if __name__ == "__main__":
    main()
