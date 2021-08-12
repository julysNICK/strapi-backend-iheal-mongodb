const { parseMultipartData, sanitizeEntity } = require('strapi-utils');



module.exports = {

  async update(ctx) {
    const { id } = ctx.params;
    const { IsStore } = ctx.state.user;
    const { status } = ctx.request.body;
    let entity;
    if (IsStore) {
      entity = await strapi.services.order.update({ id }, { status });
    } else {
      entity = await strapi.services.order.update({ id }, { status });
    }

    return sanitizeEntity(entity, { model: strapi.models.order });
  },

  async find(ctx) {
    const { user } = ctx.state
    let entities;

    if (ctx.query._q) {

      entities = await strapi.services.order.search({ ...ctx.query, });

    } else {

      entities = await strapi.services.order.find({ ...ctx.query });

    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.order }));
    // let entities;
    // if (ctx.query._q) {
    //   entities = await strapi.services.order.search(ctx.query);
    // } else {
    //   entities = await strapi.services.order.find(ctx.query);
    // }

    // return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.order }));
  },
  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state

    const entity = await strapi.services.order.findOne({ _id: id });
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
  async create(ctx) {
    const { id, IsStore } = ctx.state.user;
    const { product, total, quantity, status } = ctx.request.body;
    console.log('request')
    console.log(ctx.request.body)
    if (!product) {
      return ctx.throw(400, 'Missing product');
    }
    if (!IsStore) {

      const realProduct = await strapi.services.product.findOne({ id: product.id });

      if (!realProduct) {
        return ctx.throw(404, 'product not found');
      }

      const { user } = ctx.state;

      const BASE_URL = ctx.request.headers.origin || 'http://localhost:3000' //So we can redirect back

      const newOrder = await strapi.services.order.create({
        user_order: user.id,
        product: realProduct.id,
        total: total,
        quantity: quantity,
        status: status,
      })

      return { message: "order created" }

    }

    return { message: "not user" }
  },
  async checkOrders(ctx) {
    const { id, IsStore } = ctx.state.user;
    console.log("id", id)
    if (IsStore) {
      const orders = await strapi.services.order.find(ctx.query);
      console.log(orders)
      return orders.map((order) => {
        if (order.product.user_creator == id) {
          console.log("aqui")
          console.log(order)
          return {
            id: order._id,
            product: order.product,
            total: order.total,
            status: order.status,
            quantity: order.quantity,
            user_order: {
              id: order.user_order.id,
              username: order.user_order.username,
              email: order.user_order?.email,
              address: order.user_order?.address,
              numberHouse: order.user_order?.numberHouse,
            },
          }
        }
      })
    } else {
      const orders = await strapi.services.order.find({ ...ctx.query });
      return orders.map(order => {
        return {
          id: order.id,
          product: order.product,
          total: order.total,
          status: order.status,
          quantity: order.quantity,
          user_order: {
            id: order.user_order.id,
            username: order.user_order.username,
            email: order.user_order?.email,
            address: order.user_order?.address,
            numberHouse: order.user_order?.numberHouse,
          },
        }
      })

    }

  }

};
