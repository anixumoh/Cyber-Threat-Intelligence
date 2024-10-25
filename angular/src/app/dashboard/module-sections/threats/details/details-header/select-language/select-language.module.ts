import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SelectLanguageComponent } from "app/dashboard/module-sections/threats/details/details-header/select-language/select-language.component";
import { SelectLanguageService } from "app/dashboard/module-sections/threats/details/details-header/select-language/select-language.service";
import { SelectModule } from "app/dashboard/module-sections/shared/filters/select/select.module";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SelectModule
  ],
  declarations: [SelectLanguageComponent],
  providers: [SelectLanguageService],
  exports: [SelectLanguageComponent]
})

export class SelectLanguageModule {}
