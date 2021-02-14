const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const config = require('config');

// @route  Get api/profile/me
// @des    Get current user profile
// @access Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ errors: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: 'Sever error' });
  }
});

// @route  post api/profile
// @des    Create or update user profile
// @access Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    // Build profile objects
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build sucial objetc
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin - linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: 'Server error' });
    }
  }
);

// @route  Get api/profile
// @des    Get all profiles
// @access public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.send(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: 'Server error' });
  }
});

// @route  Get api/profile/user/:user_id
// @des    Get profile by user id
// @access public
router.get('/user/:user_id', async (req, res) => {
  try {
    const id = req.params;
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ errors: 'User doesnt exist' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ errors: 'User doesnt exist' });
    }
    res.status(500).json({ errors: 'Server error' });
  }
});

// @route  Delete api/profile
// @des    Delete profile, user & posts
// @access private
router.delete('/', auth, async (req, res) => {
  const user_id = req.user.id;
  try {
    // @todo - remove user posts

    // Remove profile
    await Profile.findOneAndRemove({ user: user_id }, (err) => {
      err
        ? console.error(err)
        : console.log(`Profile of user with id ${user_id} was deleted`);
    });

    // Remove user
    await User.findOneAndRemove({ _id: user_id }, (err) => {
      err
        ? console.error(err)
        : console.log(`Profile of user with id ${user_id} was deleted`);
    });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: 'Server error' });
  }
});

// @route  Put api/profile/experience
// @des    Add profile experience
// @access private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id }, (err) => {
        err ? console.error(err) : console.log('Profile updated');
      });

      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: 'Server error' });
    }
  }
);

// @route  Delete api/profile/experience/:exp_id
// @des    Delete experience from profile
// @access private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  const user_id = req.user.id;
  const exp_id = req.params.exp_id;

  try {
    const profile = await Profile.findOne({ user: user_id });

    if (!profile) {
      return res.status(400).json({ errors: 'Profile doesnt exists' });
    }

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(exp_id);

    if (removeIndex < 0) {
      return res.status(400).json({ errors: 'Experince doesnt exists' });
    }
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: 'Server error' });
  }
});

// @route  Put api/profile/education
// @des    Add profile education
// @access private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const user_id = req.user.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: user_id });
      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);

      if (!profile) {
        return res.status(400).json({ errors: 'Profile doesnt exists' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: 'Server error' });
    }
  }
);

// @route  Delete api/profile/education/:edu_id
// @des    Delete education from profile
// @access private
router.delete('/education/:edu_id', auth, async (req, res) => {
  const user_id = req.user.id;
  const edu_id = req.params.edu_id;

  try {
    const profile = await Profile.findOne({ user: user_id });

    if (!profile) {
      return res.status(400).json({ errors: 'Profile doesnt exists' });
    }

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(edu_id);

    if (removeIndex < 0) {
      return res.status(400).json({ errors: 'Experince doesnt exists' });
    }
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: 'Server error' });
  }
});

// // @route  Get api/profile/github/:username
// // @des    Get user repos from github
// // @access public
// router.get('/github/:username', (req, res) => {
//   try {
//     const options = {
//       uri: `https://api.github.com/users/${
//         req.params.username
//       }/repos?per_page=5&sort=created:asc&client_id=${config.get(
//         'githubClientId'
//       )}&client_secret=${config.get('githubSecret')}`,
//       method: 'Get',
//       headers: { 'user-agent': 'node.js' },
//     };

//     request(options, (error, response, body) => {
//       if (error) console.error(error);

//       if (response.statusCode != 200) {
//         return res.status(404).json({ errors: 'No github profile found' });
//       }
//       res.json(JSON.parse(body));
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ errors: 'Server error' });
//   }
// });

module.exports = router;
