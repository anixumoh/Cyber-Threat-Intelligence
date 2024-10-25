export class InfiniteScrollModel{

  constructor(
    private completeArray: any[],
    private scrollPercent: number,
    private num: number,
    private page: number,
    private _partialArray: any[] = []
  ){
    this.limitRender();
  }

  get partialArray(){
    return this._partialArray;
  }

  infiniteScroll(event){
    if(this._partialArray.length!=this.completeArray.length){
      let max = event.target.scrollHeight - event.target.offsetHeight;
      let actual = event.target.scrollTop;
      let percent = (1-actual/max)*100;
      if(percent < this.scrollPercent){
        this.page += 1;
        this._partialArray = this._partialArray.concat(this.completeArray.slice(this.num*this.page, this.num*(this.page+1)))
      }
    }
  }

  limitRender(){
    if(this.completeArray && this.num){
      this._partialArray = this.completeArray.slice(0,this.num);
    }else{
      this._partialArray = [...this.completeArray];
    }
  }
}
