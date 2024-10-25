type DebounceType = {
  value: string;
  startSearch: number;
  func: () => void;
};

export default function debounce(node, { duration }: any) {
  let timer;

  return {
    update(obj: DebounceType) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (obj.value === '' || obj.value.length >= obj.startSearch) {
          obj.func();
        }
      }, duration);
    },
    destroy() {
      clearTimeout(timer);
    }
  };
}
