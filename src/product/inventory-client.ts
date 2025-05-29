import { Injectable } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { Options } from 'amqplib';

@Injectable()
export class InventoryClient {
  private readonly connection: amqp.AmqpConnectionManager;
  private readonly channelWrapper: amqp.ChannelWrapper;

  constructor() {
    this.connection = amqp.connect([
      process.env.RABBITMQ_URL || 'amqp://localhost',
    ]);
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel) =>
        channel.assertQueue('inventory_queue', { durable: true }),
    });
  }

  async updateInventory(productId: string, quantity: number): Promise<boolean> {
    try {
      const messageOptions: Options.Publish = {
        persistent: true,
      };

      await this.channelWrapper.sendToQueue(
        'inventory_queue',
        { productId, quantity },
        messageOptions,
      );
      return true;
    } catch (error) {
      console.error('Error sending inventory update:', error);
      return false;
    }
  }

  async close() {
    await this.channelWrapper.close();
    await this.connection.close();
  }
}
