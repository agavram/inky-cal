import {
  Resource,
  RobotClient,
  StructType,
  commonApi,
} from '@viamrobotics/sdk';
import { Struct } from 'google-protobuf/google/protobuf/struct_pb';

export class GenericClient implements Resource {
  private client: RobotClient;
  private readonly name: string;

  constructor(client: RobotClient, name: string) {
    this.client = client;
    this.name = name;
  }

  async doCommand(command: StructType): Promise<StructType> {
    const request = new commonApi.DoCommandRequest();
    request.setName(this.name);
    request.setCommand(Struct.fromJavaScript(command));

    const response = await new Promise<commonApi.DoCommandResponse>(
      (resolve, reject) => {
        this.client.genericService.doCommand(request, (error, res) => {
          if (error) {
            reject(error);
          }
          resolve(res!);
        });
      },
    );

    return response.getResult()?.toJavaScript() ?? {};
  }
}
