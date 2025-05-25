const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildById = async function (req, res, next) {
  // get inventory id from params
  const inventory_id = req.params.inv_id;

  // get specific vehicle data
  const vehicleDetails = await invModel.getInventoryItemById(inventory_id);

  // in case vehicle isn't found
  if (!vehicleDetails) {
    return res.status(404).send("Vehicle not found");
  }

  const nav = await utilities.getNav();
  const detailView = await utilities.buildDetailView(vehicleDetails);

  // render detail view
  res.render("./inventory/detail", {
    title: vehicleDetails.inv_year + " " + vehicleDetails.inv_make + " " + vehicleDetails.inv_model,
    nav,
    detailView,
  });
};


module.exports = invCont






