#!/usr/bin/env python3
"""Automated Test Runner for Microsoft GraphRAG Pipeline"""
import sys
import unittest

def run():
    loader = unittest.TestLoader()
    suite = loader.discover("tests")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)

if __name__ == "__main__":
    run()
