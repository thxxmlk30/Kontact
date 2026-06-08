const User = require('../models/User');
const db = require('../config/db');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

describe('User Model', () => {
  it('should find user by email', async () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    db.query.mockResolvedValue([[mockUser]]);

    const user = await User.findByEmail('test@test.com');
    expect(user).toEqual(mockUser);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM users WHERE email = ?'), ['test@test.com']);
  });

  it('should return null if user not found', async () => {
    db.query.mockResolvedValue([[]]);

    const user = await User.findByEmail('unknown@test.com');
    expect(user).toBeNull();
  });
});
