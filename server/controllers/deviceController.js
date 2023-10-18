const uuid = require('uuid')
const path = require('path');
const { Device, DeviceInfo } = require('../models/models')
const ApiError = require('../error/ApiError');

class DeviceController {
    async create(req, res, next) {
        try {
            let {name, description, info} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const device = await Device.create({name, description, img: fileName});

            if (info) {
                info = JSON.parse(info)
                info.forEach(i =>
                    DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id
                    })
                )
            }

            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async getAll(req, res) {
        let devices;
        devices = await Device.findAll()
        return res.json(devices)
    }

    async getOne(req, res) {
        const {id} = req.params
        const device = await Device.findOne(
            {
                where: {id},
                include: [{model: DeviceInfo, as: 'info'}]
            },
        )
        return res.json(device)
    }

    async updateOne(req, res) {
      const id = req.params.id;
      const device = await Device.update(req.body, {
        where: { id: id }
      })
      res.json(device);
    }


    async deleteOne(req, res) {
      const {id} = req.params;
      const device = await Device.destroy(
        {
          where: {id}
      })
      .then(function (deletedRecord) {
          if(deletedRecord === 1){
              res.status(200).json({message:"Deleted successfully"});          
          }
          else
          {
              res.status(404).json({message:"record not found"})
          }
      })
      .catch(function (error){
          res.status(500).json(error);
      }
    )
    return res.json(device)
  }
}

module.exports = new DeviceController()
