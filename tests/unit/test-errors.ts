import { NotFoundError, DuplicateEmailError } from '../../src/lib/errors';

describe('NotFoundError', () => {
  const error = new NotFoundError('User not found');

  test('is an instance of Error', () => {
    expect(error).toBeInstanceOf(Error);
  });

  test('name is "NotFoundError"', () => {
    expect(error.name).toBe('NotFoundError');
  });

  test('message is passed through', () => {
    expect(error.message).toBe('User not found');
  });
});

describe('DuplicateEmailError', () => {
  const error = new DuplicateEmailError('alice@example.com');

  test('is an instance of Error', () => {
    expect(error).toBeInstanceOf(Error);
  });

  test('name is "DuplicateEmailError"', () => {
    expect(error.name).toBe('DuplicateEmailError');
  });

  test('message includes the email', () => {
    expect(error.message).toBe('Email already exists: alice@example.com');
  });
});
