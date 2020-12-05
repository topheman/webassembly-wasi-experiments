use std::fs::File;
use std::io::prelude::*;

fn main() -> std::io::Result<()> {
    let mut file = File::create("tmp.txt")?;
    file.write_all("Hello, world!".as_bytes())?;
    Ok(())
}
