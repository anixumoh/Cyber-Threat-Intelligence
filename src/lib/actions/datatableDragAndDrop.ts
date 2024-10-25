export function arrayMove<T>(arr: T[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
}

type Options = {
  onMove: (from: number, to: number) => unknown;
  canMove?: (from: number) => boolean;
  canMoveToPosition?: (to: number) => boolean;
};

export default function datatableDragAndDrop(node: HTMLElement, options: Options) {
  const nodeIsTable = node.nodeName.toUpperCase() === 'TABLE';
  const table = nodeIsTable ? node : node.querySelector('table');
  if (!table) return console.error('datatableDragAndDrop: No table found');
  let draggingElement: HTMLTableRowElement;
  let draggingElementHeight: number;
  let tablePositions = [];
  let throttlePause = false;
  let targetPosition: number;
  let allDisabled = false;
  let currentMovingPosition: number;
  let trs: HTMLTableRowElement[] = [];
  table.style['border-collapse'] = 'collapse';

  init();

  function mouseDownHandler(event: PointerEvent) {
    if (allDisabled) return;
    const target = event.target as HTMLElement;
    const isButton = target.closest('button, a, label');
    if (isButton) return;
    if (!target) return;
    const tr = target.closest('tr');
    currentMovingPosition = +tr.dataset.position;
    if (!options?.canMove(currentMovingPosition)) return;
    setNoSelection();
    createFakeElement(event, tr);
    highLightSelected(tr);
    getTablePositions();
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  function setNoSelection() {
    table.style['user-select'] = 'none';
  }

  function highLightSelected(tr) {
    tr.style['background-color'] = 'var(--selected-color, #eee)';
  }

  function throttle(callback: () => void, time: number) {
    if (throttlePause) return;
    throttlePause = true;
    setTimeout(() => {
      callback();
      throttlePause = false;
    }, time);
  }

  function getTablePositions() {
    tablePositions = [];
    trs.forEach((tr) => {
      const rect = tr.getBoundingClientRect();
      tablePositions.push(rect.y + rect.height);
    });
    const lastTr = trs[trs.length - 1];
    const rect = lastTr.getBoundingClientRect();
    tablePositions.push(rect.y + rect.height + rect.height);
  }

  function mouseMoveHandler(event: PointerEvent) {
    throttle(() => {
      setDragPosition(event);
      moveTarget(event);
    }, 30);
  }

  function moveTarget(event: PointerEvent) {
    targetPosition = getPosition(event);
    trs.forEach((tr, index) => {
      let borderTop = 0;
      let borderBottom = 0;
      if (currentMovingPosition === targetPosition) {
        // code here..
      } else if (currentMovingPosition + 1 === targetPosition) {
        // code here...
      } else if (targetPosition === index && options?.canMoveToPosition(targetPosition)) {
        borderTop = draggingElementHeight;
      } else if (
        targetPosition === trs.length &&
        index === trs.length - 1 &&
        options?.canMoveToPosition(targetPosition - 1)
      ) {
        borderBottom = draggingElementHeight;
      }

      tr.style['border-style'] = 'solid';
      tr.style['border-color'] = 'var(--selected-color, #eee)';
      tr.style['border-width'] = `${borderTop}px 0 ${borderBottom}px 0`;
    });
  }

  function getPosition(event: PointerEvent) {
    let idx = tablePositions.findIndex((y) => event.clientY < y);
    if (idx === -1) idx = tablePositions.length - 1;
    return idx;
  }

  function mouseUpHandler() {
    allDisabled = true;
    draggingElement?.remove();
    setTimeout(() => {
      table.style['user-select'] = null;
      trs.forEach((tr) => {
        tr.style['border-style'] = null;
        tr.style['border-color'] = null;
        tr.style['border-width'] = null;
        tr.style['background-color'] = null;
      });
      allDisabled = false;
    }, 100);
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    if (targetPosition === undefined) return;
    if (currentMovingPosition === targetPosition) return;
    if (currentMovingPosition === targetPosition - 1) return;

    const from = currentMovingPosition;
    const to = targetPosition > currentMovingPosition ? targetPosition - 1 : targetPosition;
    options.onMove(from, to);
    setTimeout(reset);
  }

  function createFakeElement(event: PointerEvent, element: HTMLTableRowElement) {
    draggingElement = element.cloneNode(true) as HTMLTableRowElement;
    draggingElement.style['position'] = 'fixed';
    draggingElement.style['z-index'] = '10';
    draggingElement.style['transition'] = 'all 0.1s ease';
    draggingElement.style['top'] = '0';
    draggingElement.style['width'] = 'auto';
    draggingElement.style['background-color'] = '#327abd1a';

    setDragPosition(event);
    table.append(draggingElement);
    draggingElementHeight = element.getBoundingClientRect().height;

    const draggingElementWidth = draggingElement.getBoundingClientRect().width;
    draggingElement.style['left'] = `-${draggingElementWidth / 2}px`;
  }

  function setDragPosition(event: PointerEvent) {
    draggingElement.style['transform'] = `translate(${event.clientX}px, ${event.clientY}px)`;
  }

  function reset() {
    trs.forEach((tr) => {
      tr.removeEventListener('mousedown', mouseDownHandler);
    });
    init();
  }

  function init() {
    trs = Array.from(table.querySelectorAll('tbody tr'));
    trs.forEach((tr, index) => {
      tr.style['transition'] = 'all 0.1s ease-in-out';
      tr.dataset.position = `${index}`;
      tr.addEventListener('mousedown', mouseDownHandler);
    });
  }
}
