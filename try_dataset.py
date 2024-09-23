from datasets import load_dataset

cache_directory = "./datasets"
ds1 = load_dataset("community-datasets/qa_zre", cache_dir=cache_directory + "/qa_zre")
ds2 = load_dataset("azhx/counterfact", cache_dir=cache_directory + "/azhx/counterfact")

# Print the structure of the datasets to examine their columns
print("DS1 (qa_zre) structure:", ds1['train'].features)
print("DS2 (azhx/counterfact) structure:", ds2['train'].features)

print("\nChecking context in qa_zre dataset:")
for index, entry in enumerate(ds1['train']):
    print(f"Entry {index}: {entry['context']}")
    if index >= 10:  # Limit to first 10 entries for brevity
        break