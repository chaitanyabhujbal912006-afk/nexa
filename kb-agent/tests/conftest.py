import sys
from unittest.mock import MagicMock

# Mock sentence-transformers globally for all pytest tests to prevent loading heavy torch/transformers
sys.modules["sentence_transformers"] = MagicMock()
