import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products!: Product[];
  currentCategoryId!: number;
  currentCategoryName!: string;
  searchMode!: boolean;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts(): void {
    // Check exist keyword on url or not
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    // If exist
    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap
      .get('keyword')!
      .toString();

    this.currentCategoryName = theKeyword;
    // now search for the products using keyword
    this.productService.searchProducts(theKeyword).subscribe((data) => {
      this.products = data;
    });
  }

  handleListProducts() {
    // The params? mean that can be null and use param1!.parma2 is an expression isn't null
    this.route.paramMap.subscribe((params) => {
      // Check if "id" parameter is available
      let hasCategoryId: boolean = params.has('id');

      if (hasCategoryId) {
        // Get the "id" param string. convert string ti a number using the "+" symbol
        this.currentCategoryId = +params.get('id')!.toString();

        // Get the "name" param string remove % and other info behind
        this.currentCategoryName = params.get('name')!.split('%')[0];
      } else {
        // Not category id available ...default to category id 1
        this.currentCategoryId = 1;
        this.currentCategoryName = 'Books';
      }
    });

    // Now get the products for the given category id
    this.productService
      .getProductList(this.currentCategoryId)
      .subscribe((data) => {
        this.products = data;
      });
  }
}
