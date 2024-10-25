export function getPaginationInfo(currentPage: number, totalPages: number, currentIndex: number, pageSize: number) {
  let previous = false;
  let next = false;
  let previousPage = currentPage;
  let nextPage = currentPage;
  let nextIndex = currentIndex + 1;
  let previousIndex = currentIndex - 1;

  if (currentPage === 1 && currentIndex !== 0) {
    previous = true;
  }

  if (currentPage > 1) {
    previous = true;
    if (currentIndex === 0) {
      previousPage = currentPage - 1;
      previousIndex = pageSize - 1;
    }
  }

  const lastIndexOfPage = currentIndex === pageSize - 1;

  if (!(currentPage === totalPages && lastIndexOfPage)) {
    next = true;
    if (lastIndexOfPage) {
      nextPage = currentPage + 1;
      nextIndex = 0;
    }
  }

  return {
    previous,
    next,
    previousPage,
    nextPage,
    nextIndex,
    previousIndex
  };
}
