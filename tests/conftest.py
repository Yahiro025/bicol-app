import os
import sys

# Add the project root to sys.path so that tests can import source modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
