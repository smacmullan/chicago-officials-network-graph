import pandas as pd
import json

# Load the CSV file for email data
df = pd.read_csv('data/OBM sample email data.csv')

# Load the CSV file for employee data
employee_df = pd.read_csv('data/Chicago_Current_Employees_20240904.csv')

# Split the "Name" column into "last_name" and "first_name"
def split_name(name):
    # Split the name by comma
    last_name, first_name = name.split(',', 1)
    # Remove leading/trailing spaces and take the first word from the first_name (ignoring middle initials)
    first_name = first_name.strip().split()[0]
    return last_name.strip(), first_name.strip()

employee_df[['last_name', 'first_name']] = employee_df['Name'].apply(lambda name: pd.Series(split_name(name)))


def get_employee_info(name):
    standardized_name = name.strip().upper().split()
    if len(standardized_name) < 2:
        # assume non-person name (email address, email group, application name, etc)
        return {'position': None, 'department': None, 'salary': None}
    first_name = standardized_name[0]
    last_name = standardized_name[1]

    # Search for the name in the employee data
    employee_row = employee_df[(employee_df['first_name'] == first_name) & (employee_df['last_name'] == last_name)]
    if not employee_row.empty:
        row = employee_row.iloc[0]
        return {
            'position': row['Job Titles'],
            'department': row['Department'],
            'salary':  None if pd.isna(row['Annual Salary']) else row['Annual Salary']
        }
    return {'position': None, 'department': None, 'salary': None}



## Process email data

# Create a set of nodes (unique email addresses)
nodes = set(df['Email From'].dropna().unique())
for recipients in df['Email To'].dropna():
    if recipients:  # Check if the string is not empty
        nodes.update([email.strip() for email in recipients.split(';') if email.strip()])

# Create nodes list for sigma.js
nodes_list = []
for email in nodes:
    # Create node with additional info if available
    employee_info = get_employee_info(email)
    node = {
        'id': email,
        'label': email,
        'position': employee_info['position'],
        'department': employee_info['department'],
        'salary': employee_info['salary']
    }
    nodes_list.append(node)

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
