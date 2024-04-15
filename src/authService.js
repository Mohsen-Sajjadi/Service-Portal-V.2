// authService.js
export const authenticateUser = (username, password, setProject) => {
    fetch('http://localhost:3001/projects')
      .then(res => res.json())
      .then(data => {
        const userProject = data.find(project => project.username === username && project.password === password);
        if (userProject) {
          setProject(userProject);
        } else {
          alert('Authentication failed');
        }
      });
};