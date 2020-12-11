use std::env;
use std::fs::File;
use std::io::prelude::*;

fn main() -> std::io::Result<()> {
    let args: Vec<String> = env::args().collect();
    let mut content = String::new();
    content.push_str("Hello, world!\n");
    for (i, arg) in args.iter().enumerate() {
        if i > 0 {
            content.push_str(arg);
            content.push_str("\n");
        }
    }
    let mut file = File::create("tmp.txt")?;
    file.write_all(content.as_bytes())?;
    Ok(())
}
