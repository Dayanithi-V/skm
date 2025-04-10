interface User {
  username: string;
  password: string;
  email: string;
}

export const userStorage = {
  createUser: (username: string, password: string, email: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // Check if username already exists
    if (users.some((user: User) => user.username === username)) {
      throw new Error('Username already exists');
    }
    // Add new user
    users.push({ username, password, email });
    localStorage.setItem('users', JSON.stringify(users));
  },

  validateUser: (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.username === username);
    return user && user.password === password;
  },

  userExists: (username: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.some((user: User) => user.username === username);
  }
}; 