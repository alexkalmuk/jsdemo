#!/bin/python3

import cgi
import sys

form = cgi.FieldStorage()
data = form['data'].value

with open('out.txt', 'w') as f:
	f.write(data)
