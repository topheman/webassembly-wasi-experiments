FROM python:3.8.6-slim-buster

# https://github.com/wasmerio/wasmer-python#readme

# install wasmer and its compiler
RUN pip install wasmer==1.0.0-beta1
RUN pip install wasmer_compiler_cranelift==1.0.0-beta1

# final
RUN mkdir code

WORKDIR /code
