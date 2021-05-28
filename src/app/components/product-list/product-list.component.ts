import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 1;
  currentCategoryName: string = 'Books';
  searchMode: boolean = false;
  previousCategoryId: number = 1;

  // New properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  previousKeyword?: string;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService
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

    // If we have different keyword than previous
    // then set thePageNumber to 1
    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    console.log(`keyword=${theKeyword},thePageNumber=${this.thePageNumber}`);

    this.currentCategoryName = theKeyword;
    // now search for the products using keyword
    this.productService
      .searchProductsPaginate(
        this.thePageNumber - 1,
        this.thePageSize,
        theKeyword
      )
      .subscribe(this.processResult());
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
    /*
    Check if we have different category than previous
    Note: Angular will reuse a component if currently being viewed
    */

    // If we have a different category id than previous
    // Then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;
    console.log(
      `currentCategoryId=${this.currentCategoryId},thePageNumber=${this.thePageNumber}`
    );

    // Now get the products for the given category id
    this.productService
      .getProductListPaginate(
        this.thePageNumber - 1, //Default Angular is 1 and Spring Boot is 0 at start
        this.thePageSize,
        this.currentCategoryId
      )
      .subscribe(this.processResult());
  }

  processResult() {
    return (data: any) => {
      // Left is frontend properties to get data from json data (right)
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1; //Because Spring Boot is 0 and Angular is 1 at start
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  updatePageSize(pageSize: any) {
    if (pageSize !== 5) pageSize = +pageSize.target.value;
    // Set page size
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    // Refresh Page
    this.listProducts();
  }

  addToCart(theProduct: Product) {
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    // TODO ... do the real work
    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
  }
}
