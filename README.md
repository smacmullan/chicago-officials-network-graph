# Chicago Officials Network Graph
The [Chicago Officials Network Graph](https://smacmullan.github.io/chicago-officials-network-graph/) is a network graph showing how City of Chicago employees communicate with each other. It is intended to aid city officials and Chicago residents with navigating the city goverment by identifying individuals who serve as connections between city departments.

The current network graph is based on a small sample of data focused on the Office of Budget and Management.

# Running the project
This project uses Python to convert the raw email data into network data. Run the `scripts/emails_to_network.py` script to convert the data and save it to `public/graph-data.json`.

The network graph is built with [sigma.js](https://www.sigmajs.org/). The graph is configured in `public/graph.js`. You can view the graph locally by running a web server that serves `index.html` (I'm using the Live Server feature in VS Code). This project is using GitHub Pages on the repository to host the graph as a static site.

# Data Sources
This project is based on two data sources:
* **Email logs** obtained from FOIA requests. These include the email timestamps, to, from, cc, and bcc fields.
* **A list of city employees** downloaded from the [respective data set on the Chicago Open Data Portal](https://data.cityofchicago.org/Administration-Finance/Current-Employee-Names-Salaries-and-Position-Title/xzkq-xp2w/about_data). This includes employee names, their job title, department, and salary.

# Helping with FOIA requests
Currently, the City of Chicago is only fulfilling email log FOIA requests that specify emails from a small number of individuals over a short period of time. Larger requests are being cited as unduly burdensome and denied. I am working with the Illinois Public Access Counselor to get the City of Chicago to fulfill larger email log requests so that I can FOIA emails for an entire city department at one time.

In the meantime, you can assist with collecting more data by submitting additional smaller FOIA requests. See the example in the `foia` folder in this repository. I am determining my list of individuals by searching for high-salaried employees within a given city department. I am specifying a date range of one week.  You can submit a FOIA request online through the [Chicago FOIA portal](https://www.chicago.gov/city/en/progs/foia.html). The request should be directed at the city department in question or at DTI if the request does not apply to a single city department.

If you questions about FOIA, please review this [FOIA FAQs document](https://foiapac.ilag.gov/content/pdf/FAQ_FOIA_Government.pdf) from the Illinois Public Access Counselor's office.
