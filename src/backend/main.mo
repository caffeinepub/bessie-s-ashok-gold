import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    image : Storage.ExternalBlob;
    category : Text;
    inStock : Bool;
  };

  type CustomerInfo = {
    name : Text;
    country : Text;
    phone : Text;
    address : Text;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
    #cancelled;
  };

  type Order = {
    id : Nat;
    customerInfo : CustomerInfo;
    items : [(Nat, Nat)];
    total : Float;
    status : OrderStatus;
    timestamp : Int;
  };

  type Cart = [(Nat, Nat)];

  var nextProductId = 1;
  var nextOrderId = 1;

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let carts = Map.empty<Principal, Cart>();

  public query ({ caller }) func listProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    price : Float,
    image : Storage.ExternalBlob,
    category : Text,
  ) : async Nat {
    let product : Product = {
      id = nextProductId;
      name;
      description;
      price;
      image;
      category;
      inStock = true;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async Bool {
    switch (products.get(id)) {
      case (null) { false };
      case (?_) {
        products.remove(id);
        true;
      };
    };
  };

  public shared ({ caller }) func updateProductPrice(id : Nat, newPrice : Float) : async Bool {
    switch (products.get(id)) {
      case (null) { false };
      case (?product) {
        let updatedProduct = { product with price = newPrice };
        products.add(id, updatedProduct);
        true;
      };
    };
  };

  public shared ({ caller }) func updateProductStock(id : Nat, inStock : Bool) : async Bool {
    switch (products.get(id)) {
      case (null) { false };
      case (?product) {
        let updatedProduct = { product with inStock };
        products.add(id, updatedProduct);
        true;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    let cart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
    carts.add(caller, cart.concat([(productId, quantity)]));
  };

  public shared ({ caller }) func placeOrder(
    name : Text,
    country : Text,
    phone : Text,
    address : Text,
  ) : async ?Nat {
    let cart = switch (carts.get(caller)) {
      case (null) { return null };
      case (?items) { items };
    };

    var total : Float = 0.0;
    for ((productId, quantity) in cart.values()) {
      switch (products.get(productId)) {
        case (null) { return null };
        case (?product) { total += product.price * quantity.toFloat() };
      };
    };

    let customerInfo = {
      name;
      country;
      phone;
      address;
    };

    let order : Order = {
      id = nextOrderId;
      customerInfo;
      items = cart;
      total;
      timestamp = Time.now();
      status = #pending;
    };

    orders.add(nextOrderId, order);
    carts.remove(caller);
    nextOrderId += 1;
    ?order.id;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : OrderStatus) : async Bool {
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        let updatedOrder = { order with status = newStatus };
        orders.add(orderId, updatedOrder);
        true;
      };
    };
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async Bool {
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        let updatedOrder = { order with status = #cancelled };
        orders.add(orderId, updatedOrder);
        true;
      };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    orders.values().toArray();
  };
};
