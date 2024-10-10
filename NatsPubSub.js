const { PubSubEngine } = require('graphql-subscriptions');
const { connect, StringCodec } = require('nats');

class NatsPubSub extends PubSubEngine {
  constructor(natsUrl) {
    super();
    this.sc = StringCodec();
    this.client = connect({ servers: natsUrl });
    this.subscribers = new Map();
  }

  async publish(triggerName, payload) {
    const nc = await this.client;
    nc.publish(triggerName, this.sc.encode(JSON.stringify(payload)));
  }

  async subscribe(triggerName, onMessage) {
    const nc = await this.client;
    const sub = nc.subscribe(triggerName);
    const sid = Math.random().toString(36).substring(2);

    (async () => {
      for await (const msg of sub) {
        onMessage(JSON.parse(this.sc.decode(msg.data)));
      }
    })();

    this.subscribers.set(sid, sub);
    return sid;
  }

  async unsubscribe(subId) {
    const sub = this.subscribers.get(subId);
    if (sub) {
      sub.unsubscribe();
      this.subscribers.delete(subId);
    }
  }
}

module.exports = NatsPubSub; // Export the NatsPubSub class

