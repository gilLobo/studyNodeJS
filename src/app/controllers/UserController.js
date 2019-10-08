import * as Yup from 'yup';
import User from '../models/User';

class UserController {
    async store(req, res) {
        // Validação de criação do usuário utilizando a biblioteca Yup
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            senha: Yup.string().required().min(6)
        });

        if(!(await schema.isValid(req.body))){
            return res.status(400).json({ error: 'Validation fails.' });
        }

        const userExist = await User.findOne({ where: { email: req.body.email } });

        if (userExist){
            return res.status(400).json({ error: 'User already exists.' });
        }
        const { id, name, email, provider } = await User.create(req.body);

        return res.json({
            id,
            name,
            email,
            provider,
        });
    }

    async update(req, res) {
        // Validação de criação do usuário utilizando a biblioteca Yup
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(6),
            password: Yup.string()
                .min(6)
                .when('oldPassword', (oldPassword, field) => 
                    oldPassword ? field.required() : field
            ),
            confirmPassword: Yup.string()
                .min(6)
                .when('password', (password, field) => 
                    // oneOf() recebe um array, Yup.ref referencia o campo password então confirmPass = password
                    password ? field.required().oneOf([Yup.ref('password')]) : field
            ),
        });

        if(!(await schema.isValid(req.body))){
            return res.status(400).json({ error: 'Validation fails.' });
        }

        const { email, oldPassword } = req.body;

        const user = await User.findByPk(req.userId);

        if (user.email != email) {
            const userExist = await User.findOne({ where: { email } });

            if (userExist){
                return res.status(400).json({ error: 'User already exists.' });
            }
        }

        if(oldPassword && !(await user.checkPassword(oldPassword))) {
            return res.status(401).json({ error: 'Password does not match' });
        }

        const { id, name, provider } = await user.update(req.body);

        return res.json({
            id,
            name,
            email,
            provider,
        });
    }
}

export default new UserController();