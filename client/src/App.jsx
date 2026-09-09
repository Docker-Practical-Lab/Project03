import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/users')
      .then(response => setUsers(response.data.users))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  return <div>{users.map(user => (
    <p key={user._id}>{user.name}</p>
  ))}</div>;
}

export default App
