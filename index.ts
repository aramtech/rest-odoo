import env_obj from "../../env.js";
import { trim_slashes } from "../common/index.js";
import { callViaRPC, createClient } from "../xmlrpc/index.js";

type OdooInstanceDetails = {
    server_version: string;
    server_version_info: [number, number, number, string, number, string];
    serve_serie: string;
    protocol_version: number;
};

interface OdooClient {
    instanceDetails: OdooInstanceDetails & { user_id: number };
}

type OdooConfig = typeof env_obj.services.odoo;

const createOdooClient = async (config: OdooConfig): Promise<OdooClient> => {
    const url = trim_slashes(config.url);

    const rpcClient = createClient({ url: `${url}/xmlrpc/2/common` });

    const [version_details, current_odoo_user_id] = await Promise.all([
        callViaRPC<OdooInstanceDetails>(rpcClient, "version", []),
        callViaRPC<number>(rpcClient, "authenticate", [config.db, config.username, config.password, {}]),
    ]);

    return {
        instanceDetails: { ...version_details, user_id: current_odoo_user_id },
    };
};

export { OdooClient, OdooConfig, OdooInstanceDetails, createOdooClient };
