from pathlib import Path
path = Path('src/services/authService.js')
text = path.read_text()
old =  const query = [\n INSERT INTO users (email, username, password_hash, role),\n OUTPUT INSERTED.id, INSERTED.email, INSERTED.username, INSERTED.role,\n VALUES (@email, @username, @password, @role),\n ] .join \\n \n\n
new =  const query = [\n INSERT INTO users (email, username, password_hash, role),\n OUTPUT INSERTED.id, INSERTED.email, INSERTED.username, INSERTED.role,\n VALUES (@email, @username, @password, @role),\n ] .join \\\\n \n\n
path.write_text(text.replace(old, new, 1))
