import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ConfirmDeleteHabitDialog from '../src/lib/ConfirmDeleteHabitDialog.svelte';

describe('ConfirmDeleteHabitDialog', () => {
  it('enables Delete only on exact name match', async () => {
    (HTMLDialogElement.prototype as any).showModal = function () { this.open = true; };
    (HTMLDialogElement.prototype as any).close = function () { this.open = false; };
    const { component, getByLabelText, getByRole } = render(ConfirmDeleteHabitDialog, {
      props: { habitName: 'Test' }
    });
    component.open();
    const input = getByLabelText("Type the habit's name to confirm") as HTMLInputElement;
    const del = getByRole('button', { name: 'Delete' }) as HTMLButtonElement;
    expect(del.disabled).toBe(true);
    await fireEvent.input(input, { target: { value: 'Wrong' } });
    expect(del.disabled).toBe(true);
    await fireEvent.input(input, { target: { value: 'Test' } });
    expect(del.disabled).toBe(false);
  });
});
