// Cloudflare Pages Functions - D1 Database API Handler
// Matches all /api/* routes

interface Env {
  DB: D1Database;
}

const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '');
  const segments = path.split('/').filter(Boolean);
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (!env.DB) {
    return jsonResponse({ error: 'D1 Database binding (DB) is not configured' }, 500);
  }

  const db = env.DB;

  try {
    // -------------------------------------------------------------
    // CATEGORIES
    // -------------------------------------------------------------
    if (segments[0] === 'categories') {
      if (method === 'GET') {
        const { results } = await db.prepare('SELECT * FROM CMS_categories ORDER BY name ASC').all();
        return jsonResponse(results);
      }
      if (method === 'POST') {
        const body = await request.json() as any;
        const res = await db.prepare('INSERT INTO CMS_categories (name, description) VALUES (?, ?) RETURNING *')
          .bind(body.name, body.description || null)
          .first();
        return jsonResponse(res, 201);
      }
    }

    // -------------------------------------------------------------
    // MENU ITEMS
    // -------------------------------------------------------------
    if (segments[0] === 'menu-items') {
      if (method === 'GET') {
        const { results } = await db.prepare('SELECT * FROM CMS_menu_items ORDER BY id ASC').all();
        // Convert availability from 1/0 to boolean
        const formatted = results.map((r: any) => ({ ...r, availability: Boolean(r.availability) }));
        return jsonResponse(formatted);
      }
      if (method === 'POST') {
        const body = await request.json() as any;
        const res = await db.prepare(
          'INSERT INTO CMS_menu_items (category_id, name, description, price, image_url, availability) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
        ).bind(
          body.category_id || null, 
          body.name, 
          body.description || null, 
          body.price, 
          body.image_url || null, 
          body.availability ? 1 : 0
        ).first();
        return jsonResponse({ ...(res as any), availability: Boolean((res as any)?.availability) }, 201);
      }
      if (method === 'PATCH' && segments[1]) {
        const id = segments[1];
        const body = await request.json() as any;
        if (body.availability !== undefined) {
          await db.prepare('UPDATE CMS_menu_items SET availability = ? WHERE id = ?')
            .bind(body.availability ? 1 : 0, id).run();
        }
        const updated = await db.prepare('SELECT * FROM CMS_menu_items WHERE id = ?').bind(id).first();
        return jsonResponse({ ...(updated as any), availability: Boolean((updated as any)?.availability) });
      }
    }

    // -------------------------------------------------------------
    // INVENTORY
    // -------------------------------------------------------------
    if (segments[0] === 'inventory') {
      if (method === 'GET') {
        const { results } = await db.prepare('SELECT * FROM CMS_inventory ORDER BY item_name ASC').all();
        return jsonResponse(results);
      }
      if (method === 'PATCH' && segments[1]) {
        const id = segments[1];
        const body = await request.json() as any;
        await db.prepare('UPDATE CMS_inventory SET quantity = ?, updated_at = datetime("now") WHERE id = ?')
          .bind(body.quantity, id).run();
        const updated = await db.prepare('SELECT * FROM CMS_inventory WHERE id = ?').bind(id).first();
        return jsonResponse(updated);
      }
    }

    // -------------------------------------------------------------
    // SUPPLIERS
    // -------------------------------------------------------------
    if (segments[0] === 'suppliers') {
      if (method === 'GET') {
        const { results } = await db.prepare('SELECT * FROM CMS_suppliers ORDER BY id ASC').all();
        return jsonResponse(results);
      }
      if (method === 'POST') {
        const body = await request.json() as any;
        const res = await db.prepare('INSERT INTO CMS_suppliers (supplier_name, contact_info) VALUES (?, ?) RETURNING *')
          .bind(body.supplier_name, body.contact_info)
          .first();
        return jsonResponse(res, 201);
      }
    }

    // -------------------------------------------------------------
    // PURCHASES
    // -------------------------------------------------------------
    if (segments[0] === 'purchases') {
      if (method === 'GET') {
        const { results } = await db.prepare(
          'SELECT p.*, s.supplier_name FROM CMS_purchases p LEFT JOIN CMS_suppliers s ON p.supplier_id = s.id ORDER BY p.id DESC'
        ).all();
        return jsonResponse(results);
      }
      if (method === 'POST') {
        const body = await request.json() as any;
        const res = await db.prepare('INSERT INTO CMS_purchases (supplier_id, total_amount) VALUES (?, ?) RETURNING *')
          .bind(body.supplier_id, body.total_amount)
          .first();
        return jsonResponse(res, 201);
      }
    }

    // -------------------------------------------------------------
    // ORDERS
    // -------------------------------------------------------------
    if (segments[0] === 'orders') {
      if (method === 'GET') {
        const { results: orders } = await db.prepare('SELECT * FROM CMS_orders ORDER BY id DESC').all();
        const { results: orderItems } = await db.prepare(
          'SELECT oi.*, mi.name as menu_item_name FROM CMS_order_items oi LEFT JOIN CMS_menu_items mi ON oi.menu_item_id = mi.id'
        ).all();

        const itemsByOrderId: Record<number, any[]> = {};
        orderItems.forEach((item: any) => {
          itemsByOrderId[item.order_id] = itemsByOrderId[item.order_id] || [];
          itemsByOrderId[item.order_id].push(item);
        });

        const fullOrders = orders.map((o: any) => ({
          ...o,
          items: itemsByOrderId[o.id] || [],
        }));
        return jsonResponse(fullOrders);
      }

      if (method === 'POST') {
        const body = await request.json() as any;
        const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        const order = await db.prepare(
          'INSERT INTO CMS_orders (customer_id, order_number, status, total_amount, payment_status) VALUES (?, ?, ?, ?, ?) RETURNING *'
        ).bind(
          body.customerId || null,
          orderNumber,
          body.status || 'pending',
          body.totalAmount,
          body.paymentMethod ? 'paid' : 'unpaid'
        ).first();

        const orderId = (order as any).id;

        // Insert order items
        if (Array.isArray(body.items)) {
          for (const item of body.items) {
            await db.prepare(
              'INSERT INTO CMS_order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)'
            ).bind(orderId, item.menu_item_id, item.quantity, item.price).run();
          }
        }

        // Insert payment
        if (body.paymentMethod) {
          await db.prepare(
            'INSERT INTO CMS_payments (order_id, payment_method, amount, transaction_reference) VALUES (?, ?, ?, ?)'
          ).bind(
            orderId,
            body.paymentMethod,
            body.totalAmount,
            `TXN-${Math.floor(100000 + Math.random() * 900000)}`
          ).run();
        }

        return jsonResponse(order, 201);
      }

      if (method === 'PATCH' && segments[1]) {
        const id = segments[1];
        const body = await request.json() as any;
        if (body.payment_status) {
          await db.prepare('UPDATE CMS_orders SET status = ?, payment_status = ? WHERE id = ?')
            .bind(body.status, body.payment_status, id).run();
        } else {
          await db.prepare('UPDATE CMS_orders SET status = ? WHERE id = ?')
            .bind(body.status, id).run();
        }
        const updated = await db.prepare('SELECT * FROM CMS_orders WHERE id = ?').bind(id).first();
        return jsonResponse(updated);
      }
    }

    // -------------------------------------------------------------
    // NOTIFICATIONS
    // -------------------------------------------------------------
    if (segments[0] === 'notifications') {
      if (method === 'GET') {
        const { results } = await db.prepare('SELECT * FROM CMS_notifications ORDER BY id DESC LIMIT 50').all();
        const formatted = results.map((r: any) => ({ ...r, read_status: Boolean(r.read_status) }));
        return jsonResponse(formatted);
      }
      if (method === 'PATCH' && segments[1]) {
        const id = segments[1];
        await db.prepare('UPDATE CMS_notifications SET read_status = 1 WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }
    }

    // -------------------------------------------------------------
    // AUDIT LOGS
    // -------------------------------------------------------------
    if (segments[0] === 'audit-logs') {
      if (method === 'GET') {
        const { results } = await db.prepare('SELECT * FROM CMS_audit_logs ORDER BY id DESC LIMIT 100').all();
        return jsonResponse(results);
      }
    }

    // -------------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------------
    if (segments[0] === 'auth') {
      if (segments[1] === 'login' && method === 'POST') {
        const body = await request.json() as any;
        const user = await db.prepare('SELECT * FROM CMS_profiles WHERE email = ?').bind(body.email).first();
        if (user) {
          return jsonResponse({ user });
        }
        return jsonResponse({ error: 'User not found' }, 404);
      }
      if (segments[1] === 'signup' && method === 'POST') {
        const body = await request.json() as any;
        const newId = crypto.randomUUID();
        const user = await db.prepare(
          'INSERT INTO CMS_profiles (id, full_name, email, role) VALUES (?, ?, ?, ?) RETURNING *'
        ).bind(newId, body.full_name || body.email.split('@')[0], body.email, body.role || 'customer').first();
        return jsonResponse({ user }, 201);
      }
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
};
