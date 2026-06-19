import { formatUptime } from '../../src/utils/uptime';

describe('formatUptime — zero', () => {
  test('returns "0s" for 0 seconds', () => {
    expect(formatUptime(0)).toBe('0s');
  });
});

describe('formatUptime — seconds only (< 60)', () => {
  test('returns "1s" for 1 second', () => {
    expect(formatUptime(1)).toBe('1s');
  });

  test('returns "45s" for 45 seconds', () => {
    expect(formatUptime(45)).toBe('45s');
  });

  test('returns "59s" for 59 seconds', () => {
    expect(formatUptime(59)).toBe('59s');
  });
});

describe('formatUptime — minutes boundary', () => {
  test('returns "1m" for exactly 60 seconds — omits zero seconds unit', () => {
    expect(formatUptime(60)).toBe('1m');
  });

  test('returns "2m" for exactly 120 seconds — omits zero seconds unit', () => {
    expect(formatUptime(120)).toBe('2m');
  });
});

describe('formatUptime — minutes and seconds', () => {
  test('returns "1m 1s" for 61 seconds', () => {
    expect(formatUptime(61)).toBe('1m 1s');
  });

  test('returns "1m 59s" for 119 seconds', () => {
    expect(formatUptime(119)).toBe('1m 59s');
  });
});

describe('formatUptime — hours boundary', () => {
  test('returns "1h" for exactly 3600 seconds — omits zero minutes unit', () => {
    expect(formatUptime(3600)).toBe('1h');
  });

  test('returns "2h" for exactly 7200 seconds — omits zero minutes unit', () => {
    expect(formatUptime(7200)).toBe('2h');
  });
});

describe('formatUptime — hours with remainder', () => {
  test('returns "1h 1s" for 3601 seconds — omits zero minutes unit', () => {
    expect(formatUptime(3601)).toBe('1h 1s');
  });

  test('returns "1h 1m" for 3660 seconds — omits zero seconds unit', () => {
    expect(formatUptime(3660)).toBe('1h 1m');
  });

  test('returns "1h 1m 1s" for 3661 seconds', () => {
    expect(formatUptime(3661)).toBe('1h 1m 1s');
  });
});

describe('formatUptime — days boundary', () => {
  test('returns "1d" for exactly 86400 seconds — omits zero hours unit', () => {
    expect(formatUptime(86400)).toBe('1d');
  });

  test('returns "2d" for exactly 172800 seconds — omits zero hours unit', () => {
    expect(formatUptime(172800)).toBe('2d');
  });
});

describe('formatUptime — days with remainder', () => {
  test('returns "1d 1h" for 90000 seconds — omits zero minutes unit', () => {
    expect(formatUptime(90000)).toBe('1d 1h');
  });

  test('returns "1d 2h 2m 5s" for 93725 seconds (example from spec)', () => {
    expect(formatUptime(93725)).toBe('1d 2h 2m 5s');
  });
});

describe('formatUptime — fractional seconds', () => {
  test('floors 1.9 to "1s"', () => {
    expect(formatUptime(1.9)).toBe('1s');
  });

  test('floors 59.99 to "59s"', () => {
    expect(formatUptime(59.99)).toBe('59s');
  });

  test('floors 60.9 to "1m" — omits zero seconds after floor', () => {
    expect(formatUptime(60.9)).toBe('1m');
  });
});
