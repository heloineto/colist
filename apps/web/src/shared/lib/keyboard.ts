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

/**
 * iOS Safari ignores `interactive-widget=resizes-content`: the keyboard only shrinks
 * the visual viewport, so `position: fixed` bottom sheets stay behind it.
 * Publishes the covered height as `--keyboard-inset` (0 wherever the layout resizes).
 */
export function trackKeyboardInset() {
  const viewport = window.visualViewport;
  if (!viewport) return;
  const update = () => {
    const inset = window.innerHeight - viewport.height - viewport.offsetTop;
    document.documentElement.style.setProperty(
      '--keyboard-inset',
      `${Math.max(0, Math.round(inset))}px`
    );
  };
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
}
