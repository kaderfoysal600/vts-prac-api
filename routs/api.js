const express = require("express");
const router = express.Router();
const Role = require("../model/role");
const User = require("../model/user");
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PermissionGroup = require("../model/permissionGroup");
const PermissionGroupItem = require("../model/permissionGroupItem");
const RolePermission = require("../model/rolePermission");
const fs = require("fs");
// JWT Secret Key
const jwtSecretKey = 'kaderfoysal600';


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

var upload = multer({ storage: storage });

//role

router.post("/addRole", (req, res) => {

  console.log(req.body);
  Role.create(req.body)
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.get("/listRole", (req, res) => {
  Role.findAll()
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      console.log(err);
    });
});

router.put("/updateRole/:id", (req, res) => {
  //console.log(req.body);
  Role.update(req.body, {
    where: {
      id: req.params.id
    }
  })
    .then(data => {
      console.log(data);
      res.send({
        message: "Role Updated successfully!"
      });
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.delete("/deleteRole/:id", (req, res) => {
  Role.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(data => {
      console.log(data);
      res.send({
        message: "Role Deleted successfully!"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(409).json({ success: false, error: err, message: "Cannot delete row because it is referenced by child records in the database." });
    });
});




//user

router.post("/addUser", upload.single("photo"), async (req, res) => {

  try {
    const existingUser = await User.findOne({
      where: {
        email: req.body.email
      }
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }
    console.log('request....................', req)
    const file = req.file
    User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      name: req.body.first_name + " " + req.body.last_name,
      mobile: req.body.mobile,
      email: req.body.email,
      address: req.body.address,

      role_id: req.body.role_id,
      // @ts-ignore
      photo: req?.file?.path,
      gender: req.body.gender,
      // password:req.body.password,
      password: bcrypt.hashSync(req.body.password, 8),
      // status:req.body.status
    })

      .then(data => {
        console.log("data", data)

        res.status(200).send(
          {
            message: "User Added successfull", status: "ok",
            data: data,
            file: file
          });
      })
      .catch(err => {
        res.json("error:" + err);
      });

  } catch (err) {
    res.status(500).json({ error: "An error occurred." });
  }
});
// Define a route for user login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // Create a JWT token for the authenticated user
    const token = jwt.sign({ id: user.id }, jwtSecretKey, {
      expiresIn: 86400 // 24 hours 
    });
    // Store the token in the session
    // @ts-ignore
    req.session.token = token;


    res.status(200).send(
      {
        message: "login successfull", status: "ok", data: {
          id: user.id,
          email: user.email,
          // email: user.email,
          accessToken: token
        }
      });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token." });
    }
    req.user = user;
    next();
  });
}

router.get('/protected-route', authenticateToken, (req, res) => {
  // This route is protected and can only be accessed by authenticated users.
  // The user object from the token is available as req.user.
  res.status(200).json({ success: true, message: "Protected route accessed." });
});

// router.post("/login", (req, res)=> {
//   const { username, password } = req.body;
//           // // Create a JWT token
//           // const token = jwt.sign(
//           //   { userId: data.id },
//           //   jwtSecretKey,
//           //   {
//           //     algorithm: 'HS256',
//           //     allowInsecureKeySizes: true,
//           //     expiresIn: 86400, // 24 hours
//           //   });

//           // // Store the token in session storage
//           // // @ts-ignore
//           // req.session.token = token;
//           // // @ts-ignore
//           // req.session.user = User;
//           // // @ts-ignore
//           // console.log(' req.session.user', req.session.user);
//           // // @ts-ignore
//           // console.log('req.session.token', req.session.token)
//           // res.send({token,data});
// })

router.get("/listUser", async (req, res) => {
  try {
    const users = await User.findAll()
    res.send(users);
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/editUser/:userId', upload.single('photo'), (req, res) => {
  const userId = req.params.userId;
  const file = req.file;
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);



  User.findByPk(userId).then((user) => {
    console.log('userToUpdate', user);
    if (user.photo) {
      const photoPath = user.photo;
      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error("Error deleting photo:", err);
        }
      });
    }
  })
  // Prepare the updated user data
  const updatedUserData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    name: req.body.first_name + ' ' + req.body.last_name,
    mobile: req.body.mobile,
    email: req.body.email,
    address: req.body.address,
    role_id: req.body.role_id,
    gender: req.body.gender,
  };

  if (file) {
    updatedUserData.photo = file.path; // Update the photo path if a new image is uploaded
  }

  // if (req.body.password) {
  //   updatedUserData.password = bcrypt.hashSync(req.body.password, 8);
  // }

  User.update(updatedUserData, {
    where: { id: userId },
  })
    .then((result) => {
      if (result[0] === 1) {
        res.send({
          message: "User Updated successfully!"
        });
      } else {
        res.send('User not found');
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.delete("/deleteuser/:id", (req, res) => {
  User.findByPk(req.params.id).then((user) => {
    console.log('usertodelete', user);
    if (user.photo) {
      const photoPath = user.photo;
      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error("Error deleting photo:", err);
        }
      });
    }
  })

  User.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(data => {
      console.log(data);
      res.send({
        message: "User was deleted successfully!"
      });
    })
    .catch(err => {
      console.log(err);
    });
});



//permissions groups

router.post("/addPermissionGroup", (req, res) => {
  console.log(req.body);

  PermissionGroup.create(req.body)
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.get("/getPermissionGroups", (req, res) => {
  PermissionGroup.findAll()
    .then(permissionGroups => {
      console.log(permissionGroups);
      res.send(permissionGroups);
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.put("/updatePermissionGroup/:id", (req, res) => {
  const id = req.params.id;

  PermissionGroup.findByPk(id)
    .then(permissionGroup => {
      if (permissionGroup) {
        permissionGroup.update(req.body)
          .then(updatedGroup => {
            console.log(updatedGroup);
            res.send(updatedGroup);
          })
          .catch(err => {
            res.json("error:" + err);
          });
      } else {
        res.json("Permission group not found.");
      }
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.delete("/deletePermissionGroup/:id", (req, res) => {
  const id = req.params.id;

  PermissionGroup.findByPk(id)
    .then(permissionGroup => {
      if (permissionGroup) {
        permissionGroup.destroy()
          .then(() => {
            // res.json("Permission group deleted.");
            console.log('res', res.status);
            res.status(200).json({ success: true, message: "Permission group deleted." });
          })
          .catch(err => {
            // res.json("error:" + err);
            res.status(409).json({ success: false, error: err, message: "Cannot delete row because it is referenced by child records in the database." });
          });
      } else {
        res.json("Permission group not found.");
      }
    })
    .catch(err => {
      res.json("error:" + err);
    });
});


//permissions group items

router.post("/addPermissionGroupItem", (req, res) => {
  console.log(req.body);

  PermissionGroupItem.create(req.body)
    .then(data => {
      console.log('dataasaasssas', data);
      res.status(200).send({ message: "data added successfully", success: true, data: data });
    })
    .catch(err => {
      res.json("error:" + err);
      res.status(500).json({ success: false, error: err, message: "something went wrong" });
    });
});

router.get("/getPermissionGroupItems", (req, res) => {
  PermissionGroupItem.findAll()
    //need to find ...permissiongroup name
    .then(permissionGroupItems => {
      console.log(permissionGroupItems);
      res.send(permissionGroupItems);
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.put("/updatePermissionGroupItem/:id", (req, res) => {
  const id = req.params.id;

  PermissionGroupItem.findByPk(id)
    .then(permissionGroupItem => {
      if (permissionGroupItem) {
        permissionGroupItem.update(req.body)
          .then(updatedItem => {
            console.log(updatedItem);
            res.send(updatedItem);
          })
          .catch(err => {
            res.json("error:" + err);
          });
      } else {
        res.json("Permission group item not found.");
      }
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.delete("/deletePermissionGroupItem/:id", (req, res) => {
  const id = req.params.id;

  PermissionGroupItem.findByPk(id)
    .then(permissionGroupItem => {
      if (permissionGroupItem) {
        permissionGroupItem.destroy()
          .then(() => {
            res.json("Permission group item deleted.");
          })
          .catch(err => {
            res.json("error:" + err);
          });
      } else {
        res.json("Permission group item not found.");
      }
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

//role permission

router.post("/addRolePermission", async (req, res) => {
  console.log('req.body', req.body);
  let newArr = req.body[0].itemToUpdate;
  let itemDelete = req.body[0].itemToDelete;

  try {
    const permissionsPromises = [];

    newArr.forEach((element) => {
      console.log('element121', element);
      console.log('now data will add');

      permissionsPromises.push(
        RolePermission.create({
          role_id: req.body[1]?.role_id,
          permission_group_id: element?.permission_group_id,
          permission: element?.permission,
        })
      );
    });

    const deletePromises = itemDelete.map((elmD) => {
      console.log('elmD', elmD);
      return RolePermission.findOne({
        where: {
          permission: elmD?.permission,
          role_id: req.body[1]?.role_id
        }
      })
        .then((rolePermission) => {
          if (rolePermission) {
            return rolePermission.destroy();
          }
        }).catch(err => {
          console.log('err', err);
          res.json("error:" + err);
        });
    });

    // Wait for all permission creations and deletions to complete
    await Promise.all([...permissionsPromises, ...deletePromises]);

    res.status(201).json({ message: "Role Permissions updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getRolePermissions/:id", (req, res) => {
  console.log('req.params', req.params)
  RolePermission.findAll()
    .then(rolePermissions => {
      console.log('rolePermissions', rolePermissions);
      const filteredData = rolePermissions.filter((item) => {
        console.log('item.role_id', item.role_id);
        console.log('req.params.id', req.params.id);
        return item.role_id == req.params.id
      })
      console.log('filteredData', filteredData);
      res.send({
        message: "Role Permission Fetched successfully!",
        data: filteredData
      });
      console.log('data', res)
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.put("/updateRolePermission/:id", (req, res) => {
  const id = req.params.id;

  RolePermission.findByPk(id)
    .then(rolePermission => {
      if (rolePermission) {
        rolePermission.update(req.body)
          .then(updatedPermission => {
            console.log(updatedPermission);
            res.send(updatedPermission);
          })
          .catch(err => {
            res.json("error:" + err);
          });
      } else {
        res.json("Role permission not found.");
      }
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

router.delete("/deleteRolePermission/:id", (req, res) => {
  const id = req.params.id;

  RolePermission.findByPk(id)
    .then(rolePermission => {
      if (rolePermission) {
        rolePermission.destroy()
          .then(() => {
            res.send({
              message: "Role Permission Deleted successfully!"
            });
          })
          .catch(err => {
            res.json("error:" + err);
          });
      } else {
        res.json("Role permission not found.");
      }
    })
    .catch(err => {
      res.json("error:" + err);
    });
});

module.exports = router;