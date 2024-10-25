export default function modalTeleport(node: HTMLElement) {
  const teleportContainer = document.getElementById('modalTeleport');
  teleportContainer?.appendChild(node);
  return {
    destroy() {
      node.remove();
    }
  };
}
