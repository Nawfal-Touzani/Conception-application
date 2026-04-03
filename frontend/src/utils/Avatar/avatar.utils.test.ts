import { describe, it, expect } from 'vitest';
import { formatAvatarUrl } from './avatar.utils';

describe('formatAvatarUrl', () => {
  it('should correctly concatenate baseUrl and path in nominal case', () => {
    const baseUrl = 'http://localhost:3000';
    const path = '/images/avatar1.png';

    const result = formatAvatarUrl(baseUrl, path);

    expect(result).toBe('http://localhost:3000/images/avatar1.png');
  });

  it('should handle empty path', () => {
    const baseUrl = 'http://localhost:3000';
    const path = '';

    const result = formatAvatarUrl(baseUrl, path);

    expect(result).toBe('http://localhost:3000');
  });

  it('should handle empty baseUrl', () => {
    const baseUrl = '';
    const path = '/images/avatar1.png';

    const result = formatAvatarUrl(baseUrl, path);

    expect(result).toBe('/images/avatar1.png');
  });
});
