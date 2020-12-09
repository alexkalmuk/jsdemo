#!/bin/python3

import cgi
import sys
import os
import time

print("Content-Type: text/html")    # HTML is following
print()                             # blank line, end of headers

form = cgi.FieldStorage()
path = form['path'].value

if path == "hello.js":
	# Emulate delay for hello world example
	time.sleep(1)
	print("Hello World")
elif path == "i2c.js":
	# Emulate delay for i2c example
	time.sleep(5)
