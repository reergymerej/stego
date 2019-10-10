# Stego

0001 -> file

binary -> encoding -> string

Why do I need to include an encoding when creating a file?  Isn't the encoding
an interpretation of the bytes?

  You DON'T!

  > The encoding option is ignored if data is a buffer.

A buffer is just bytes.  It's pure.  You only need to encode/decode when you
cross that boundary.

When you want to deal with straight up binary, use a buffer.

Buffers work with octets, so values must be 0-255.  Anothing over gets %ed.
