import { render, screen } from '@testing-library/react';
import App from './App';

test('renders game selection title', () => {
  render(<App />);
  const title = screen.getByText(/ゲーム選択/i);
  expect(title).toBeInTheDocument();
});
