/**
 * iOS Safari only shows the keyboard for `focus()` called synchronously inside a tap.
 * Focusing a throwaway input during the tap keeps the keyboard "armed", so a later
 * async `focus()` on the real input (focus trap, after the overlay mounts) still shows it.
 * Call from the tap handler that opens an overlay with an auto-focused input.
 */
export function armKeyboard() {
  const decoy = document.createElement('input');
  decoy.setAttribute('aria-hidden', 'true');
  decoy.style.cssText =
    'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;pointer-events:none';
  decoy.addEventListener('blur', () => decoy.remove());
  document.body.append(decoy);
  decoy.focus();
}
