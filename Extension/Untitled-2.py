import os
import sqlite3
import subprocess
import pickle
import yaml
import jsonpickle # pip install jsonpickle (if testing)
import shutil
import re
import xml.etree.ElementTree as ET # For XXE
from flask import Flask, request, render_template, send_from_directory # pip install Flask

# --- Flask App Setup (for web vulnerabilities) ---
app = Flask(__name__)

# --- Database Initialization ---
def init_db(db_name='app_data.db'):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY,
            user_id TEXT NOT NULL,
            item TEXT NOT NULL,
            quantity INTEGER NOT NULL
        )
    ''')
    # Insert some dummy data
    cursor.execute("INSERT OR IGNORE INTO products (id, name, price) VALUES (1, 'Laptop', 1200.00)")
    cursor.execute("INSERT OR IGNORE INTO products (id, name, price) VALUES (2, 'Mouse', 25.00)")
    conn.commit()
    return conn, cursor

# --- VULNERABILITY EXAMPLES ---

# 1. SQL Injection (f-string in SELECT)
@app.route('/product_search_v1')
def product_search_v1():
    search_term = request.args.get('name', '')
    conn, cursor = init_db()
    # VULNERABLE: Direct f-string interpolation
    query = f"SELECT id, name, price FROM products WHERE name LIKE '%{search_term}%'"
    print(f"Executing SQL: {query}")
    cursor.execute(query)
    results = cursor.fetchall()
    conn.close()
    return f"<h3>Products (V1):</h3><p>{results}</p>"

# 2. SQL Injection (old-style % formatting)
@app.route('/order_history_v1')
def order_history_v1():
    user_id = request.args.get('user_id', '')
    conn, cursor = init_db()
    # VULNERABLE: Old-style string formatting
    query = "SELECT order_id, item, quantity FROM orders WHERE user_id = '%s'" % user_id
    print(f"Executing SQL: {query}")
    cursor.execute(query)
    results = cursor.fetchall()
    conn.close()
    return f"<h3>Order History (V1) for {user_id}:</h3><p>{results}</p>"

# 3. Command Injection (os.system)
def execute_system_command(command_input):
    print(f"\nAttempting to execute: {command_input}")
    # VULNERABLE: Direct execution of user input via os.system
    os.system(f"echo 'Running command: {command_input}'")

# 4. Command Injection (subprocess.run with shell=True)
def run_shell_command_vulnerable(user_cmd):
    print(f"Running shell command: {user_cmd}")
    # VULNERABLE: subprocess.run with shell=True
    subprocess.run(user_cmd, shell=True)

# 5. Command Injection (other subprocess functions)
def call_legacy_commands(filename):
    # VULNERABLE: various subprocess calls
    subprocess.call(f"cat {filename}", shell=True)
    subprocess.check_call(f"ls -l {filename}", shell=True)
    output = subprocess.getoutput(f"grep 'admin' {filename}")
    status, out = subprocess.getstatusoutput(f"echo 'Status for {filename}'")

# 6. Unsafe Deserialization (pickle)
def load_data_from_pickle(filepath):
    try:
        # VULNERABLE: pickle.load is inherently unsafe with untrusted data
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
        print(f"Loaded pickle data: {data}")
    except Exception as e:
        print(f"Error loading pickle: {e}")

# 7. Unsafe Deserialization (yaml.load without safe_load)
def load_config_from_yaml(filepath):
    try:
        # VULNERABLE: yaml.load without specifying Loader
        with open(filepath, 'r') as f:
            config = yaml.load(f)
        print(f"Loaded YAML config: {config}")
    except Exception as e:
        print(f"Error loading YAML: {e}")

# 8. Unsafe Deserialization (jsonpickle)
def decode_jsonpickle_data(encoded_data_str):
    try:
        # VULNERABLE: jsonpickle.decode can be dangerous with untrusted data
        decoded = jsonpickle.decode(encoded_data_str)
        print(f"Decoded jsonpickle data: {decoded}")
    except Exception as e:
        print(f"Error decoding jsonpickle: {e}")

# 9. Dynamic Evaluation (eval)
def calculate_expression(expression):
    print(f"Calculating: {expression}")
    # VULNERABLE: eval() of user-controlled input
    result = eval(expression)
    print(f"Result: {result}")

# 10. Dynamic Evaluation (exec)
def execute_dynamic_code(code_string):
    print(f"Executing: {code_string}")
    # VULNERABLE: exec() of user-controlled input
    exec(code_string)

# 11. Directory Traversal / File Operations
@app.route('/download_report')
def download_report():
    filename = request.args.get('file', 'report.pdf')
    # VULNERABLE: path.join with unsanitized filename
    base_dir = "/app/reports" # Imagine this is your base report directory
    download_path = os.path.join(base_dir, filename) # Traversal here if filename is "../../../etc/passwd"
    
    print(f"Attempting to download from: {download_path}")
    # VULNERABLE: send_from_directory using potentially manipulated path
    # The regex targets send_from_directory(..., request.args.get()) directly
    return send_from_directory(base_dir, request.args.get('file'))

@app.route('/delete_file')
def delete_file():
    filepath = request.args.get('path', '')
    if not filepath:
        return "No path specified."
    
    # VULNERABLE: Direct deletion without sanitization or checks
    if os.path.exists(filepath):
        os.remove(filepath) # VULNERABLE: os.remove
        os.unlink(filepath) # VULNERABLE: os.unlink
        shutil.rmtree(filepath) # VULNERABLE: shutil.rmtree
        print(f"Attempted to delete: {filepath}")
        return f"File {filepath} deleted (if exists)."
    return "File not found."

def create_log_file(log_name):
    # VULNERABLE: open in write mode directly with user input filename
    with open(log_name, 'w') as f:
        f.write("Log entry for system event.")

# 12. Insecure Direct Object Reference (IDOR) - Hard to fully demonstrate with regex, but will flag pattern
@app.route('/user_profile_idor')
def user_profile_idor():
    # VULNERABLE: Direct use of user_id from request args without authorization check
    user_id = request.args.get('user_id')
    if user_id:
        conn, cursor = init_db()
        # This query is still vulnerable if the AI only fixed the f-string, but it's where the IDOR occurs
        query = f"SELECT username, email FROM users WHERE id = {user_id}"
        cursor.execute(query)
        profile = cursor.fetchone()
        conn.close()
        if profile:
            return f"User Profile (IDOR): {profile}"
        return "User not found."
    return "No user ID specified."

# 13. XML External Entity (XXE) Injection
def parse_xml_data(xml_string):
    try:
        # VULNERABLE: Default ElementTree.parse is generally safer against external entities
        # BUT the pattern is still a good indicator for other parsers or older versions.
        root = ET.fromstring(xml_string) # Using fromstring for simplicity, but parse() is the target
        print(f"Parsed XML root: {root.tag}")
        # To make it truly vulnerable for demonstration, you'd need a specific parser config like lxml:
        # import lxml.etree
        # parser = lxml.etree.XMLParser(resolve_entities=True)
        # root = lxml.etree.fromstring(xml_string, parser)
    except Exception as e:
        print(f"XML parsing error: {e}")

# 14. Regex Injection (simple example)
def search_log_vulnerable(search_pattern):
    log_content = "ERROR: Login failed\nINFO: User xyz logged in\nWARNING: Disk full"
    # VULNERABLE: Compiling regex directly from user input
    compiled_regex = re.compile(search_pattern)
    matches = compiled_regex.findall(log_content)
    print(f"Regex matches: {matches}")


# --- Main execution logic (to call some vulnerable functions) ---
if __name__ == "__main__":
    print("--- Starting Big Vulnerable App Test ---")

    # Command Injection tests
    execute_system_command("ls -la /tmp")
    run_shell_command_vulnerable("echo 'Hello from shell=True'")
    call_legacy_commands("/etc/passwd")

    # Deserialization tests (requires dummy files)
    # Create dummy files for testing (you'll need to run this once manually or create them)
    # with open("test_malicious.pkl", "wb") as f:
    #     pickle.dump(os.system, f) # This creates a dangerous pickle!
    # with open("test_config.yaml", "w") as f:
    #     f.write("!!python/object/apply:os.system ['echo YAML RCE test']")
    
    # load_data_from_pickle("test_malicious.pkl")
    # load_config_from_yaml("test_config.yaml")
    # decode_jsonpickle_data('{"py/object": "os.system", "py/tuple": ["echo jsonpickle RCE test"]}') # Requires jsonpickle

    # Dynamic Evaluation tests
    calculate_expression("__import__('os').getcwd()")
    execute_dynamic_code("print('This code was executed dynamically!')")

    # File Operations test
    create_log_file("user_controlled_log.txt") # VULNERABLE: open in write mode
    
    # XML XXE test
    xxe_payload = """<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
  <name>&xxe;</name>
</root>"""
    parse_xml_data(xxe_payload)

    # Regex Injection test
    search_log_vulnerable(".*(USER|PASS).*") # Normal pattern
    # Malicious regex to cause ReDoS: "(a+)+"
    # search_log_vulnerable("(a+)+") 

    print("\n--- Starting Flask server for web vulnerabilities (access via browser) ---")
    print("Visit: http://127.0.0.1:5000/product_search_v1?name=test")
    print("Visit: http://127.0.0.1:5000/order_history_v1?user_id=1")
    print("Visit: http://127.0.0.1:5000/download_report?file=../../../../etc/passwd")
    print("Visit: http://127.0.0.1:5000/delete_file?path=/tmp/test.txt") # Create /tmp/test.txt first
    print("Visit: http://127.0.0.1:5000/user_profile_idor?user_id=1")

    # Running Flask app
    app.run(debug=True, port=5000)