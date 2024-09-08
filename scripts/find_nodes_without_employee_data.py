# Use this script to find people missing employee data to help debug and improve the joining of the data sets
import json

with open('./public/graph-data.json', 'r') as f:
    data = json.load(f)

# Get all names with no employee data
names_with_null_position = [node['label'] for node in data['nodes'] if node['position'] is None]

# Write the result to a text file
with open('./data/names_without_employee_data.txt', 'w') as f:
    for name in names_with_null_position:
        # Filter out non-Chicago emails and names of mailing groups, meeting rooms, etc.
        if ("@" not in name or "@cityofchicago.org" in name) and "_" not in name and ":" not in name:
            f.write(f"{name}\n")
