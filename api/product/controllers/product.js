const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
const _ = require('lodash');
module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    const { id, IsStore } = ctx.state.user;


    if (IsStore === true) {
      // console.log(IsStore)
      // console.log("ctx", ctx)
      const { name, Description, slug, price, image, stock } = ctx.request.body;
      // const product = { name, description, slug, price, image, stock, user_creator: id };
      // const entity = await strapi.services.product.create(product);

      // return sanitizeEntity(entity, { model: strapi.models.product });
      if (ctx.is('multipart')) {
        const { data, files } = parseMultipartData(ctx);

        entity = await strapi.services.product.create(data, { files });
      } else {
        entity = await strapi.services.product.create({ ...ctx.query, name, Description, slug, price, image, stock, user_creator: id });
      }
      return sanitizeEntity(entity, { model: strapi.models.product });
    } else {
      return ctx.badRequest('you are not a store');
    }

  },
  async find(ctx) {
    const { id, IsStore } = ctx.state?.user ? ctx.state.user : {};

    if (IsStore === true) {
      let entities;
      if (ctx.query._q) {

        entities = await strapi.services.product.search({ ...ctx.query });

      } else {
        entities = await strapi.services.product.find({ ...ctx.query });

      }

      return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.product }));
    } else {
      let entities;
      let newEntities = [];
      if (ctx.query._q) {


        entities = await strapi.services.product.search({ ...ctx.query });
        console.log(entities)
      } else {

        entities = await strapi.services.product.find({ ...ctx.query });

        newEntities = entities.map(entiyy => {
          return {
            id: entiyy.id,
            name: entiyy.name,
            Description: entiyy.Description,
            price: entiyy.price,
            image: entiyy.image,
            stock: entiyy.stock,
            user_creator: entiyy.user_creator,
            user_creator_id: entiyy.user_creator._id,
          }
        })

      }

      return newEntities.map(entity => sanitizeEntity(entity, { model: strapi.models.product }));
    }

  },

  async delete(ctx) {
    const { id, IsStore } = ctx.state.user;

    if (IsStore === true) {
      const entity = await strapi.services.product.delete({ id });
      return sanitizeEntity(entity, { model: strapi.models.product });
    }
  },

};
