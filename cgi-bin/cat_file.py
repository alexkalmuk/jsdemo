#!/bin/python3

import cgi
import sys

print("Content-Type: text/html")    # HTML is following
print()                             # blank line, end of headers

form = cgi.FieldStorage()

fname = 'js_example/' + form['path'].value

with open(fname, 'r') as f:
	print(f.read())
