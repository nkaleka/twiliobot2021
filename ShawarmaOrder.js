const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SIZE: Symbol("size"),
  ITEM: Symbol("item"),
  TYPE: Symbol("type"),
  TOMATOES: Symbol("tomatoes"),
  FRIES: Symbol("fries"),
  TOPPINGS: Symbol("toppings"),
  DRINKS: Symbol("drinks"),
  PAYMENT: Symbol("payment"),
});

module.exports = class ShwarmaOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize = "";
    this.sType = "";
    this.sTomatoes = "";
    this.sFries = "";
    this.sToppings = "";
    this.sDrinks = "";
    this.nOrder = 0;
    this.sItem = "";
  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.ITEM;
        aReturn.push("Welcome to Narinderpal's Restaurant.");
        aReturn.push("What would you like - Shawarma/Burger?");
        aReturn.push("Price of burger is $5, shawarma is $8");
        break;
      case OrderState.ITEM:
        this.sItem = sInput;
        aReturn.push(`You have selected ${sInput}`);

        if (sInput.toLowerCase() === "burger") {
          this.stateCur = OrderState.TYPE;
          this.nOrder += 5;
          aReturn.push("What type of burger would you like - Beef/Cheese?");
        } else if (sInput.toLowerCase() === "shawarma") {
          this.stateCur = OrderState.SIZE;
          this.nOrder += 8;
          aReturn.push("What size of Shwarma would you like?");
        } else {
          aReturn.push("Please choose burger/shawarma");
        }
        break;
      case OrderState.TYPE:
        if (
          sInput.toLowerCase() === "beef" ||
          sInput.toLowerCase() === "cheese"
        ) {
          this.stateCur = OrderState.TOMATOES;
          this.sType = sInput;
          aReturn.push("Would you like to add tomatoes in the burger?");
        } else {
          aReturn.push("Please choose between beef and cheese.");
        }
        break;
      case OrderState.TOMATOES:
        if (sInput.toLowerCase() === "yes" || sInput.toLowerCase() === "no") {
          this.stateCur = OrderState.FRIES;
          aReturn.push("Would you like to add fries (extra charges of $4)?");
        } else {
          aReturn.push("Please choose yes/no for tomatoes?");
        }
        break;
      case OrderState.FRIES:
        if (sInput.toLowerCase() != "no") {
          this.stateCur = OrderState.DRINKS;
          this.sFries = sInput;
          this.nOrder += 4;
          aReturn.push(
            "Which drink would you like with that (extra charges of $2)?"
          );
        } else if (sInput.toLowerCase() != "yes") {
          this.stateCur = OrderState.DRINKS;
          this.sFries = sInput;
          aReturn.push(
            "Which drink would you like with that (extra charges of $2)?"
          );
        } else {
          aReturn.push("Please choose yes/no for fries");
        }
        break;
      case OrderState.SIZE:
        if (
          sInput.toLowerCase() == "small" ||
          sInput.toLowerCase() == "large"
        ) {
          this.stateCur = OrderState.TOPPINGS;
          this.sSize = sInput;
          aReturn.push("What toppings would you like?");
        } else {
          aReturn.push("Please choose small/large size");
        }

        break;
      case OrderState.TOPPINGS:
        this.stateCur = OrderState.FRIES;
        this.sToppings = sInput;
        aReturn.push("Would you like to add Fries(extra charges of $4)?");
        break;
      case OrderState.DRINKS:
        this.stateCur = OrderState.PAYMENT;
        if (sInput.toLowerCase() != "no") {
          this.sDrinks = sInput;
          this.nOrder += 2;
        }
        aReturn.push("Thank-you for your order of");
        aReturn.push(`${this.sSize} ${this.sItem} with ${this.sToppings}`);
        if (this.sDrinks) {
          aReturn.push(this.sDrinks);
        }
        if (this.sTomatoes.toLowerCase() != "no") {
          aReturn.push("tomatoes");
        }
        if (this.sFries.toLowerCase() != "no") {
          aReturn.push("fries");
        }
        aReturn.push(`Please pay for your order here`);
        aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        break;
      case OrderState.PAYMENT:
        console.log(sInput.purchase_units);
        const shipping = { ...sInput.purchase_units };
        console.log(shipping);

        console.log(sInput.purchase_units[0][shipping]);
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
        break;
    }
    return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") {
    // your client id should be kept private
    if (sTitle != "-1") {
      this.sItem = sTitle;
    }
    if (sAmount != "-1") {
      this.nOrder = sAmount;
    }
    const sClientID =
      process.env.SB_CLIENT_ID ||
      "AQK4idoHhoaKcY1-WI28Sd0JTzQQiJOtRwl2kVV5mjm0omfhzIiynnjwkZb-9t2O9XcH29tzh7JqM1Re";
    return `
      <!DOCTYPE html>

      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>

      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>

        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close();
                  });
                });
              }

            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>

      </body>

      `;
  }
};
