import pandas as pd
import json

# Load the CSV file
df = pd.read_csv('OBM sample email data.csv')

# Create a set of nodes (unique email addresses)
nodes = set(df['Email From'].dropna().unique())
for recipients in df['Email To'].dropna():
    if recipients:  # Check if the string is not empty
        nodes.update([email.strip() for email in recipients.split(';') if email.strip()])

# Create nodes list for sigma.js
nodes_list = [{'id': email, 'label': email} for email in nodes]

# Create a set to store unique edges
edges_set = set()

# Process the "Email To" column
for i, row in df.iterrows():
    from_email = row['Email From']
    to_emails = row['Email To']
    if pd.notna(to_emails) and pd.notna(from_email) and isinstance(to_emails, str):
        for to_email in to_emails.split(';'):
            to_email = to_email.strip()
            if to_email and (from_email, to_email) not in edges_set:
                # Add edge to the set if it's not already present
                edges_set.add((from_email, to_email))

edges_list = [{'id': f"e{index}_{edge[1]}", 'source': edge[0], 'target': edge[1]} for index, edge in enumerate(edges_set)]

# Combine nodes and edges into a dictionary
graph_data = {
    'nodes': nodes_list,
    'edges': edges_list
}

# Save to a JSON file for use with sigma.js
with open('public/graph-data.json', 'w') as f:
    json.dump(graph_data, f, indent=4)
