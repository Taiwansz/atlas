import React from 'react';
import { render } from '@testing-library/react';

import Page from '../src/app/page';

describe('Page', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      writable: true,
      value: jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({ isLocal: false }),
      }),
    });
  });

  it('should render successfully', () => {
    const { baseElement } = render(<Page />);
    expect(baseElement).toBeTruthy();
  });
});
